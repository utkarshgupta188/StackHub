export interface WidgetDefinition {
  id: string;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'full'; // grid span size
  component: string; // matches a registered component string
  minWidth?: number;
}

export interface CommandDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  shortcut?: string;
  action: (context: any) => void | string | Promise<void | string>; // can return a message or open modal
}

export interface PluginSetting {
  label: string;
  type: 'text' | 'password' | 'select' | 'boolean';
  value: any;
  choices?: string[];
  placeholder?: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon identifier string
  enabled: boolean;
  settings: Record<string, PluginSetting>;
  widgets: WidgetDefinition[];
  commands: CommandDefinition[];
}

export interface User {
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface FeedItem {
  id: string;
  pluginId: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
