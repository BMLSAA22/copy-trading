import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const GuideButton = () => {
  return (
    <div className="flex justify-end mb-4">
      <Button 
        variant="outline" 
        className="rounded-full px-6 text-sm hover:border-blue-400 transition-colors active:border-blue-500"
      >
        <BookOpen size={16} className="mr-2" /> Guide
      </Button>
    </div>
  );
};

export default GuideButton;
