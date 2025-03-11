import { Button, ButtonProps } from "@workspace/ui/components/button";
import { BookType } from "lucide-react";
import Link from "next/link";

interface ManualLinkButtonProps extends ButtonProps {
  href: string;
}

export function ManualLinkButton({ href, ...props }: ManualLinkButtonProps) {
  return (
    <Link href={href} passHref>
      <Button size="sm" variant="linkHover1" {...props}>
        <BookType className="mr-2 h-4 w-4" />
        查看使用手冊
      </Button>
    </Link>
  );
}
