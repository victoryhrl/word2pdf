export function Footer() {
    return (
        <footer className="w-full border-t border-border/50 bg-background/50 py-8 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Word2PDF. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Privacy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Terms
                    </a>
                </div>
            </div>
        </footer>
    );
}
