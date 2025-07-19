interface SettingsHeaderProps {
    title: string;
    description: string;
}

export function SettingsHeader({title, description}: SettingsHeaderProps) {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
