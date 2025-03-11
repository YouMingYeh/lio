"use client";

import { useUser } from "@/hooks/use-user";
import { createFeedback } from "@/lib/data/feedback/action";
import { BlurFade } from "@workspace/ui/components/blur-fade";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useState } from "react";

export default function SimpleFeedback({ data }: { data: string[] }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customFeedback, setCustomFeedback] = useState("");
  const { user } = useUser();

  // Simple array of feedback options
  const feedbackOptions = data;

  const handleOptionClick = async (option: string) => {
    if (isSubmitting) return;

    if (option === "✏️ 直接告訴我...") {
      setShowCustomInput(true);
      return;
    }

    setIsSubmitting(true);

    if (!user) {
      console.error("User not found");
      setIsSubmitting(false);
      return;
    }

    // Send feedback to backend
    const { error } = await createFeedback({
      userId: user.id,
      content: option,
    });

    if (error) {
      console.error("Error submitting feedback:", error);
      setIsSubmitting(false);
      return;
    }

    // Show thank you message
    setIsSubmitted(true);

    // Wait for thank you animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Close feedback component
    setIsVisible(false);

    // Reset state after closing animation
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSubmitting(false);
      setShowCustomInput(false);
      setCustomFeedback("");
    }, 300);
  };

  const handleCustomSubmit = async () => {
    if (isSubmitting || !customFeedback.trim()) return;
    if (!user) return;

    setIsSubmitting(true);

    // Send custom feedback to backend
    const { error } = await createFeedback({
      userId: user.id,
      content: "客製回饋: " + customFeedback,
    });

    if (error) {
      console.error("Error submitting feedback:", error);
      setIsSubmitting(false);
      return;
    }

    // Show thank you message
    setIsSubmitted(true);

    // Wait for thank you animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Close feedback component
    setIsVisible(false);

    // Reset state after closing animation
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSubmitting(false);
      setShowCustomInput(false);
      setCustomFeedback("");
    }, 300);
  };

  return (
    <BlurFade inView delay={0.1}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl mx-auto rounded-xl border bg-card p-6 shadow-sm "
          >
            <div className="flex justify-between items-start mb-4">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.h2
                    key="feedback-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-lg font-medium text-gray-700"
                  >
                    告訴我們您的想法：
                  </motion.h2>
                ) : (
                  <motion.h2
                    key="thank-you-title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-medium text-gray-700"
                  >
                    感謝您的回饋！
                  </motion.h2>
                )}
              </AnimatePresence>

              {!isSubmitted && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground"
                  aria-label="關閉回饋"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <>
                  {!showCustomInput ? (
                    <motion.div
                      key="options"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-wrap gap-2"
                    >
                      {feedbackOptions.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionClick(option)}
                          disabled={isSubmitting}
                          className={`rounded-full border py-1 px-3 text-xs transition-colors whitespace-nowrap bg-muted
                        ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"}`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="custom-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <Textarea
                        placeholder="請輸入您的回饋..."
                        value={customFeedback}
                        onChange={(e) => setCustomFeedback(e.target.value)}
                        className="min-h-[100px] w-full"
                        disabled={isSubmitting}
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomInput(false)}
                          disabled={isSubmitting}
                        >
                          返回
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCustomSubmit}
                          disabled={isSubmitting || !customFeedback.trim()}
                          className={`${
                            isSubmitting || !customFeedback.trim()
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          提交回饋
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  key="thank-you"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className=""
                >
                  我們感謝您的意見，並會用它來改進我們的服務。
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </BlurFade>
  );
}
