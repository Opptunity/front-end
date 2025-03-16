"use client"

import { useState, useRef, useEffect } from 'react'
import { CornerUpRight, BookmarkIcon, ZapIcon, Activity, Bookmark, ChevronRight, Maximize, Sun, Send } from 'lucide-react'

type QuickPrompt = {
  icon: React.ReactNode
  title: string
  category: string
  prompt: string
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAgentInterface() {
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: "Hi there! 👋 I'm your Opptunity AI Agent. I can help you develop new skills, find personalized learning resources, and plan your career growth. What would you like to focus on today?"
  }])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const quickPrompts: QuickPrompt[] = [
    {
      icon: <ZapIcon className="h-6 w-6 text-blue-500" />,
      title: "Assess my current data science skills",
      category: "Skill Assessment",
      prompt: "Can you help me assess my current data science skills?"
    },
    {
      icon: <ChevronRight className="h-6 w-6 text-blue-500" />,
      title: "How can I become a data scientist?",
      category: "Learning Path",
      prompt: "How can I become a data scientist? Please suggest a step-by-step learning path."
    },
    {
      icon: <Activity className="h-6 w-6 text-blue-500" />,
      title: "Recommend courses for machine learning",
      category: "Courses",
      prompt: "Can you recommend some good courses for learning machine learning?"
    },
    {
      icon: <CornerUpRight className="h-6 w-6 text-blue-500" />,
      title: "Help me transition to product management",
      category: "Career",
      prompt: "I want to transition to product management. What skills should I develop and how should I approach this career change?"
    }
  ]

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Send message to API
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content
      };
      
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Handle quick prompt click
  const handleQuickPromptClick = (prompt: string) => {
    sendMessage(prompt);
  }

  return (
    <div className="flex h-[650px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Left sidebar */}
      <div className="w-[320px] border-r border-gray-100 flex flex-col">
        <div className="p-4">
          <h2 className="font-medium text-gray-700 mb-3">Quick Prompts</h2>
          <div className="space-y-2">
            {quickPrompts.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickPromptClick(item.prompt)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex gap-3 items-start"
                disabled={isLoading}
              >
                <div className="bg-gray-100 p-2 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-100">
          <h2 className="font-medium text-gray-700 mb-3">Saved Items</h2>
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Bookmark className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">No saved items yet</p>
          </div>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Agent header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ZapIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Opptunity AI Agent</h1>
              <p className="text-xs text-gray-500">Your personal AI guide for upskilling</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Maximize className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Sun className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gray-100 mr-2 flex-shrink-0 flex items-center justify-center">
                  <ZapIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="h-8 w-8 rounded-full bg-gray-100 mr-2 flex-shrink-0 flex items-center justify-center">
                <ZapIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about skills, learning paths, or career advice..."
              className="flex-1 bg-gray-100 rounded-lg p-3 focus:outline-none text-gray-800 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-5 w-5 text-blue-600" />
            </button>
            <button type="button" className="p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <BookmarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 