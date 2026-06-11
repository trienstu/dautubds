export const metadata = {
  title: 'Sanity Studio',
  description: 'Sanity Studio Admin Panel',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
