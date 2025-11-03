export default function Header({ title }: { title: string }) {
    return <header>
        <h1 className="font-sans text-foreground text-6xl">{title}</h1>
        <div className="h-px w-20 bg-white mt-8 mb-8"></div>
    </header>
}
