/**
 * A React component that represents a loading page.
 *
 * This component is used as a placeholder during the loading state of a Suspense boundary.
 * Now, it returns `null` because it is intended to be used within a Suspense component to wrap
 * its children. The Suspense component will display its fallback content while the wrapped
 * components are being loaded.
 *
 * For more information on Suspense, refer to the Next.js documentation:
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
export default function LoadingPage() {
  return null;
}
