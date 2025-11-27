export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Copyleft <span className="inline-block rotate-180">&copy;</span> {currentYear} - Swell History
          </p>
        </div>
      </div>
    </footer>
  );
}
