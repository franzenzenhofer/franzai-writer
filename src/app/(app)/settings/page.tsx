"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Trash2, LogOut, AlertCircle, Loader2, Mail, Shield, Bell, Palette, Moon, Sun } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">("system");
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    autoSaveEnabled: true,
    exportReminders: false,
    showThinking: false,
    defaultModel: "gemini-2.0-flash",
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Invalid confirmation",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement actual account deletion logic
      toast({
        title: "Account deletion initiated",
        description: "Your account deletion request has been received.",
      });
      
      await handleLogout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteAccountOpen(false);
    }
  };

  // Handle preference updates
  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Preference updated",
      description: "Your preference has been saved.",
    });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access your settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <PageHeader 
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={user.email || ""} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="uid">User ID</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="uid" 
                    value={user.uid} 
                    disabled 
                    className="bg-muted font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account created</p>
                    <p className="text-sm text-muted-foreground">
                      {user.metadata?.creationTime 
                        ? new Date(user.metadata.creationTime).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last sign in</p>
                    <p className="text-sm text-muted-foreground">
                      {user.metadata?.lastSignInTime
                        ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account security and data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => setDeleteAccountOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {/* Document Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Document Preferences</CardTitle>
              <CardDescription>
                Configure how documents are created and saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autosave">Auto-save documents</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work as you type
                  </p>
                </div>
                <Switch
                  id="autosave"
                  checked={preferences.autoSaveEnabled}
                  onCheckedChange={(checked) => updatePreference("autoSaveEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="export-reminders">Export reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind to export completed documents
                  </p>
                </div>
                <Switch
                  id="export-reminders"
                  checked={preferences.exportReminders}
                  onCheckedChange={(checked) => updatePreference("exportReminders", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>AI Preferences</CardTitle>
              <CardDescription>
                Configure AI model settings and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-model">Default AI model</Label>
                <Select 
                  value={preferences.defaultModel}
                  onValueChange={(value) => updatePreference("defaultModel", value)}
                >
                  <SelectTrigger id="default-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</SelectItem>
                    <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro (Balanced)</SelectItem>
                    <SelectItem value="gemini-2.5-thinking">Gemini 2.5 Thinking (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="thinking">Show AI thinking process</Label>
                  <p className="text-sm text-muted-foreground">
                    Display AI reasoning for supported models
                  </p>
                </div>
                <Switch
                  id="thinking"
                  checked={preferences.showThinking}
                  onCheckedChange={(checked) => updatePreference("showThinking", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive updates and alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your documents
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={selectedTheme === "light" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={selectedTheme === "dark" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={selectedTheme === "system" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedTheme("system")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              
              {/* Theme Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className={cn(
                  "p-6 rounded-lg border transition-colors",
                  selectedTheme === "dark" ? "bg-gray-900 text-white" : 
                  selectedTheme === "light" ? "bg-white text-gray-900" :
                  "bg-gradient-to-r from-white to-gray-900"
                )}>
                  <p className="font-medium mb-2">Theme Preview</p>
                  <p className="text-sm opacity-70">
                    This is how your interface will look with the {selectedTheme} theme.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <p>
                All your documents, settings, and preferences will be permanently deleted.
              </p>
              <div className="pt-4">
                <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE" || isDeleting}
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}