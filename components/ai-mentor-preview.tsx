"use client"
import ScrollReveal from "./animations/scroll-reveal"
import AiMentorMockup from "./ui-mockups/ai-mentor-mockup"

export default function AiMentorPreview() {
  // const [messages, setMessages] = useState([
  //   { role: "assistant", content: "Hello! I'm your AI mentor. How can I help you today?" },
  // ])

  // const [input, setInput] = useState("")
  // const [isTyping, setIsTyping] = useState(false)

  // const predefinedResponses = {
  //   "How can I improve my project management skills?":
  //     "Based on your current role and completed courses, here are three key steps to improve your project management skills:\n\n1. Take our Agile Methodology course (recommended based on your team's workflow)\n2. Practice stakeholder communication with our interactive scenarios\n3. Join the upcoming workshop on resource allocation",

  //   "What skills are trending in my industry?":
  //     "Based on your profile in the technology sector, these skills are seeing high demand:\n\n• Cloud architecture (AWS/Azure)\n• Data science with Python\n• DevOps practices\n• AI/ML implementation\n\nI've added these to your recommended learning paths with priority indicators.",

  //   "How do I build a learning path for my team?":
  //     "To create an effective learning path for your team:\n\n1. Use our Team Assessment tool to identify collective skill gaps\n2. Set measurable learning objectives aligned with business goals\n3. Select from our curated content library or upload custom materials\n4. Schedule regular check-ins using our progress tracking dashboard\n\nWould you like me to help you get started with the Team Assessment?",
  // }

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!input.trim()) return

  //   // Add user message
  //   setMessages((prev) => [...prev, { role: "user", content: input }])

  //   // Simulate AI typing
  //   setIsTyping(true)

  //   // Get predefined response or default
  //   setTimeout(() => {
  //     const response =
  //       predefinedResponses[input as keyof typeof predefinedResponses] ||
  //       "That's an interesting question. In a full implementation, I would provide a detailed answer tailored to your specific needs and learning history."

  //     setMessages((prev) => [...prev, { role: "assistant", content: response }])
  //     setIsTyping(false)
  //   }, 1500)

  //   setInput("")
  // }

  // const handleQuickQuestion = (question: string) => {
  //   setInput(question)
  // }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Your AI Mentor</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience personalized guidance powered by advanced AI. Ask questions, get recommendations, and
              accelerate your team's growth.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <AiMentorMockup />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

