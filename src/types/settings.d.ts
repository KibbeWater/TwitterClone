export type SettingComponentProps = {
    title: string;
    description?: string;
    icon?: IconType;
    newSeparator?: boolean;
};

export type IconType = React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
        title?: string | undefined;
        titleId?: string | undefined;
    } & React.RefAttributes<SVGSVGElement>
>;
