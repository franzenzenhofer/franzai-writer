import { notFound } from 'next/navigation';
import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Metadata } from 'next';

const db = getFirestore(app);

interface PublishedPageProps {
  params: {
    publishId: string;
    format: string;
  };
}

export async function generateMetadata({
  params,
}: PublishedPageProps): Promise<Metadata> {
  try {
    const docRef = doc(db, 'publications', params.publishId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        title: 'Content Not Found',
        robots: 'noindex',
      };
    }
    
    const data = docSnap.data();
    const content = data.content;
    
    // Extract title from content if available
    let title = 'Published Content';
    if (content['html-styled']) {
      const match = content['html-styled'].match(/<title>(.*?)<\/title>/i);
      if (match) {
        title = match[1];
      } else {
        const h1Match = content['html-styled'].match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (h1Match) {
          title = h1Match[1].replace(/<[^>]*>/g, '');
        }
      }
    }
    
    return {
      title,
      description: 'Content created with Franz AI Writer',
      robots: 'noindex, nofollow',
      openGraph: {
        title,
        description: 'Content created with Franz AI Writer',
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title,
        description: 'Content created with Franz AI Writer',
      },
    };
  } catch {
    return {
      title: 'Published Content',
      robots: 'noindex',
    };
  }
}

export default async function PublishedPage({ params }: PublishedPageProps) {
  try {
    const docRef = doc(db, 'publications', params.publishId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      notFound();
    }
    
    const data = docSnap.data();
    
    if (!data.isActive) {
      notFound();
    }
    
    // Increment view count
    await updateDoc(docRef, {
      views: increment(1),
    });
    
    const content = data.content;
    const formatContent = content[params.format];
    
    if (!formatContent || !formatContent.content) {
      notFound();
    }
    
    // For HTML formats, render directly
    if (params.format === 'html-styled' || params.format === 'html-clean') {
      return (
        <div className="min-h-screen">
          <div 
            dangerouslySetInnerHTML={{ __html: formatContent.content }}
            className="published-content"
          />
          
          {/* Branding footer */}
          <footer className="mt-8 py-4 border-t text-center text-sm text-muted-foreground">
            <p>Created with <a 
              href="https://franzai.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Franz AI Writer
            </a></p>
          </footer>
        </div>
      );
    }
    
    // For other formats, show as text
    return (
      <div className="min-h-screen max-w-4xl mx-auto p-6">
        <div className="bg-card rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-4 capitalize">
            {params.format} Content
          </h1>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
            {formatContent.content}
          </pre>
        </div>
        
        <footer className="mt-8 py-4 border-t text-center text-sm text-muted-foreground">
          <p>Created with <a 
            href="https://franzai.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Franz AI Writer
          </a></p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('[Published Page] Error:', error);
    notFound();
  }
}