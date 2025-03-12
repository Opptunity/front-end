"use client"
import { Send, Paperclip, Mic, ThumbsUp, ThumbsDown, MoreHorizontal, ChevronRight, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function AiMentorMockup() {
  const { t, isRTL, language } = useLanguage()

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-[500px] flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xl font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-bold">{language === "ar" ? "مرشد الذكاء الاصطناعي" : "AI Mentor"}</h3>
            <p className="text-blue-100 text-xs">
              {language === "ar" ? "متاح دائمًا للمساعدة" : "Always available to help"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-blue-500 rounded-full">
            <BookOpen className="h-5 w-5" />
          </button>
          <button className="p-1.5 hover:bg-blue-500 rounded-full">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
        {/* System message */}
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100 max-w-[85%]">
          <p>{t("mentorGreeting")}</p>
        </div>

        {/* AI message */}
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white">
            AI
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm max-w-[75%]">
            <p className="mb-2">{t("mentorRecommendation")}</p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>{language === "ar" ? "أنماط React المتقدمة" : "Advanced React patterns"}</li>
              <li>{language === "ar" ? "إدارة الحالة مع Redux" : "State management with Redux"}</li>
              <li>{language === "ar" ? "تحسين الأداء" : "Performance optimization"}</li>
            </ul>
            <p>
              {language === "ar"
                ? "هل ترغب في إنشاء مسار تعليمي لأي من هذه المواضيع؟"
                : "Would you like me to create a learning path for any of these topics?"}
            </p>
          </div>
        </div>

        {/* User message */}
        <div className="flex gap-2 justify-end">
          <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[75%]">
            <p>
              {language === "ar"
                ? "أود معرفة المزيد عن تحسين الأداء في React. ما هي المفاهيم الرئيسية التي يجب أن أركز عليها؟"
                : "I'd like to learn more about performance optimization in React. What are the key concepts I should focus on?"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">AJ</div>
        </div>

        {/* AI response with code */}
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white">
            AI
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm max-w-[75%]">
            <p className="mb-3">
              {language === "ar"
                ? "اختيار رائع! تحسين أداء React أمر بالغ الأهمية لبناء تطبيقات سريعة الاستجابة. إليك المفاهيم الرئيسية التي يجب التركيز عليها:"
                : "Great choice! React performance optimization is crucial for building responsive applications. Here are the key concepts to focus on:"}
            </p>

            <h4 className="font-medium mb-1">
              {language === "ar" ? "1. التخزين المؤقت مع React.memo" : "1. Memoization with React.memo"}
            </h4>
            <div className="bg-gray-800 text-gray-200 p-2 rounded-md font-mono text-xs mb-3 overflow-x-auto">
              <pre>{`const MemoizedComponent = React.memo(function MyComponent(props) {
  // Your component logic
});`}</pre>
            </div>

            <h4 className="font-medium mb-1">
              {language === "ar" ? "2. useCallback لتخزين الدوال مؤقتًا" : "2. useCallback for function memoization"}
            </h4>
            <div className="bg-gray-800 text-gray-200 p-2 rounded-md font-mono text-xs mb-3 overflow-x-auto">
              <pre>{`const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);`}</pre>
            </div>

            <h4 className="font-medium mb-1">
              {language === "ar" ? "3. useMemo للحسابات المكلفة" : "3. useMemo for expensive calculations"}
            </h4>
            <div className="bg-gray-800 text-gray-200 p-2 rounded-md font-mono text-xs mb-3 overflow-x-auto">
              <pre>{`const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b],
);`}</pre>
            </div>

            <p>
              {language === "ar"
                ? "هل ترغب في إنشاء تمرين عملي لمساعدتك في تطبيق هذه المفاهيم؟"
                : "Would you like me to create a practical exercise to help you apply these concepts?"}
            </p>

            <div className="flex gap-2 mt-3">
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors">
                {language === "ar" ? "نعم، أنشئ تمرينًا" : "Yes, create an exercise"}
              </button>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors">
                {language === "ar" ? "أرني أمثلة" : "Show me examples"}
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-3 text-gray-400">
              <button className="hover:text-gray-600">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-600">
                <ThumbsDown className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">{t("suggestedQuestions")}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            language === "ar" ? "كيف أقيس أداء React؟" : "How do I profile React performance?",
            language === "ar" ? "ما هي الأدوات التي يمكنني استخدامها للتصحيح؟" : "What tools can I use for debugging?",
            language === "ar" ? "متى يجب استخدام React.memo؟" : "When should I use React.memo?",
            language === "ar" ? "هل يمكنك شرح React Fiber؟" : "Can you explain React Fiber?",
          ].map((question, i) => (
            <button
              key={i}
              className="text-xs whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              {question}
              <ChevronRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
          <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            placeholder={t("askQuestion")}
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
          <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full">
            <Mic className="h-5 w-5" />
          </button>
          <button className="p-1.5 bg-blue-600 text-white rounded-full">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

