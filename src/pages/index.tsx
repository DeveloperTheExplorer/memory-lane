import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { data, isLoading } = trpc.hello.useQuery({ text: 'client' });
  const { user, signOut } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-purple-400 via-pink-300 to-blue-400 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      {/* Animated gradient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative flex min-h-screen w-full max-w-4xl mx-auto flex-col items-center py-16 px-8 sm:px-16">

        <h1>Hello world</h1>
        {!data || isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div className="text-2xl font-bold">{data.greeting}</div>
        )}
      </main>
    </div>
  );
}

export default Home;