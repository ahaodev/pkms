import {Smartphone, Globe, Monitor, Zap, Wrench, Gamepad2, BarChart3, Lock, Star, Package2} from 'lucide-react';

export const getProjectIcon = (iconType: string) => {
    const iconProps = "h-5 w-5";
    const icons: Record<string, JSX.Element> = {
        'package2': <Package2 className={iconProps}/>,
        'smartphone': <Smartphone className={iconProps}/>,
        'globe': <Globe className={iconProps}/>,
        'monitor': <Monitor className={iconProps}/>,
        'zap': <Zap className={iconProps}/>,
        'wrench': <Wrench className={iconProps}/>,
        'gamepad2': <Gamepad2 className={iconProps}/>,
        'barchart3': <BarChart3 className={iconProps}/>,
        'lock': <Lock className={iconProps}/>,
        'star': <Star className={iconProps}/>
    };
    return icons[iconType] || icons['package2'];
};

export const iconOptions = [
    {value: 'package2', label: 'Package'},
    {value: 'smartphone', label: 'Mobile'},
    {value: 'globe', label: 'Web'},
    {value: 'monitor', label: 'Desktop'},
    {value: 'zap', label: 'Performance'},
    {value: 'wrench', label: 'Tools'},
    {value: 'gamepad2', label: 'Games'},
    {value: 'barchart3', label: 'Analytics'},
    {value: 'lock', label: 'Security'},
    {value: 'star', label: 'Featured'}
];
