export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <h2 className="text-lg font-medium">Processing login...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}

