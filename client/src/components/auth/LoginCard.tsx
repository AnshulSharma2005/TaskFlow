import { useState } from "react";
import { Redirect } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export const LoginCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  if (currentUser) {
    return <Redirect to="/" />;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({
          title: "Account created successfully!",
          description: "Welcome to TaskFlow",
        });
      } else {
        await signInWithEmail(email, password);
        toast({
          title: "Signed in successfully!",
          description: "Welcome back to TaskFlow",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tasks text-2xl text-primary-foreground"></i>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to TaskFlow</h1>
            <p className="text-muted-foreground mt-2">Sign in to manage your tasks efficiently</p>
          </div>

          {/* Auth Toggle Tabs */}
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                !isSignUp
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              data-testid="button-signin-tab"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                isSignUp
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              data-testid="button-signup-tab"
            >
              Sign Up
            </button>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="button-email-auth"
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGoogleAuth}
            disabled={loading}
            data-testid="button-google-auth"
          >
            <i className="fab fa-google text-lg"></i>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
            <button
              type="button"
              className="text-primary hover:underline ml-1"
              onClick={() => setIsSignUp(!isSignUp)}
              data-testid="button-toggle-auth-mode"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
