export interface SubMenuItem {
  name: string;
  pathName: string;
  path: string;
  icon?: string;
  active?: boolean;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  subheader: string;
  path?: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  items?: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'home',
    subheader: 'Home',
    path: '/',
    icon: 'ri:home-fill',
    active: true,
  },
  {
    id: 'settings',
    subheader: 'Settings',
    path: '#!',
    icon: 'ic:outline-settings',
  },
];

export default sitemap;
