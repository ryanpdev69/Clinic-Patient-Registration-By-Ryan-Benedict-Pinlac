import * as React from 'react'
import { cn } from '../../lib/utils'

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-md border p-4 text-sm',
      variant === 'destructive'
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-border bg-white text-foreground',
      className
    )}
    {...props}
  />
))
Alert.displayName = 'Alert'

export { Alert }
