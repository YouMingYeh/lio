import { Button } from "@workspace/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      variant="ghost"
      size="icon"
    >
      <div className="flex items-center dark:hidden">
        <Moon size={20} />
        <span className="sr-only">深色模式 </span>
      </div>

      <div className="hidden items-center dark:flex">
        <Sun size={20} />
        <span className="sr-only">淺色模式 </span>
      </div>

      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};
