interface PermissionsHeaderProps {
    title: string;
    description: string;
}

export function PermissionsHeader({title, description}: PermissionsHeaderProps) {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}