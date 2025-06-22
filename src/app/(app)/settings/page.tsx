"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Trash2, LogOut, AlertCircle, Loader2, Mail, Shield, FileText, Image, ArrowRight } from "lucide-react";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
      if (!user) return;

      // Delete all user documents from Firestore
      const documentsRef = collection(db, 'documents');
      const q = query(documentsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the Firebase Auth account
      await deleteUser(user);
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      
      router.push("/");
    } catch (error: any) {
      console.error('Delete account error:', error);
      
      // If requires recent authentication
      if (error.code === 'auth/requires-recent-login') {
        toast({
          title: "Re-authentication required",
          description: "Please log out and log in again before deleting your account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account. Please contact support.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
      setDeleteAccountOpen(false);
      setDeleteConfirmation("");
    }
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
        title="Profile & Settings"
        description="Manage your account, documents, and assets."
      />

      <div className="space-y-6">
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

        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Manage your documents and published assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              asChild
            >
              <Link href="/documents">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  All Documents
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              asChild
            >
              <Link href="/assets">
                <div className="flex items-center">
                  <Image className="mr-2 h-4 w-4" />
                  Asset Manager
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
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
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <p className="font-semibold">
                All your documents, settings, and assets will be permanently deleted.
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