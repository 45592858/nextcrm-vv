import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";

interface ContainerProps {
  title: string;
  description: string;
  visibility?: string;
  children: React.ReactNode;
}

const Container = ({
  title,
  description,
  visibility,
  children,
}: ContainerProps) => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 border-l h-full overflow-hidden">
      <div className="h-full overflow-auto pb-32">
        {children}
      </div>
    </div>
  );
};

export default Container;
