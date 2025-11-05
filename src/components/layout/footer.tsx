import * as React from "react"
import { cn } from "@/lib/utils"

export function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "w-full border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        "py-6 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4">
        Made with <span className="text-red-500">♥</span> by Arvin for <b>Planned</b>
      </div>
    </footer>
  )
}

export default Footer
