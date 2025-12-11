export default function Header({ title }: { title: string }) {
    return <header>
        <h1 className="font-sans text-background bg-foreground text-6xl inline-block uppercase p-2.5 mb-8">{title}</h1>
    </header>
}
