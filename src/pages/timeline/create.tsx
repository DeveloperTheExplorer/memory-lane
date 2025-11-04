import { useState } from 'react'
import { useRouter } from 'next/router'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTimeline } from '@/hooks/use-timeline'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CreateTimelinePage = () => {
  const router = useRouter()
  const createTimeline = useCreateTimeline()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    general?: string
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    try {
      await createTimeline.mutateAsync(formData)
      router.push('/')
    } catch (error) {
      console.error('Failed to create timeline:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create timeline. Please try again.',
      })
    }
  }


  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden">

        <main className="relative flex min-h-screen w-full max-w-4xl mx-auto flex-col py-16 px-8 sm:px-16">
          {/* Back button */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Form Card */}
          <div className="glass-strong rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Create New Timeline</h1>
              <p className="text-muted-foreground">
                Create a new timeline to organize your memories chronologically
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Timeline Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My Amazing Journey"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(errors.name && 'border-destructive')}
                  disabled={createTimeline.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe what this timeline is about..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cn(
                    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[100px] resize-y",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    errors.description && 'border-destructive'
                  )}
                  disabled={createTimeline.isPending}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  A URL-friendly slug will be automatically generated from the timeline name
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-4 rounded-md bg-destructive/10 border border-destructive">
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createTimeline.isPending}
                >
                  {createTimeline.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Timeline'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={createTimeline.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default CreateTimelinePage

