"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages

    setIsLoading(true);
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        width: "100vw", // Full viewport width
        height: "100vh", // Full viewport height
        p: 0, // No padding
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#f7f9fc",
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", height: "100%" }}>
        <Stack
          spacing={2}
          sx={{
            overflowY: "auto",
            flexGrow: 1,
            bgcolor: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 2,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: message.role === "user" ? "#e0f7fa" : "#ede7f6",
                color: "#333",
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" sx={{ fontSize: "0.95rem" }}>
                {message.content}
              </Typography>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2} sx={{ width: "100%" }}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              bgcolor: isLoading ? "#b0bec5" : "#1976d2",
              color: "#ffffff",
              "&:hover": {
                bgcolor: isLoading ? "#b0bec5" : "#115293",
              },
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
