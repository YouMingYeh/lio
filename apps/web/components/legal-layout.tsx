import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { FC, ReactNode } from "react";

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
}

const LegalLayout: FC<LegalLayoutProps> = ({ children, title }) => {
  return (
    <div className="container mx-auto py-8 pt-32">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalLayout;
