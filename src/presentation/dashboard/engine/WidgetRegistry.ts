import { WidgetComponent, WidgetMetadata } from './WidgetTypes';

class Registry {
  private widgets = new Map<string, WidgetComponent>();

  register(widget: WidgetComponent) {
    this.widgets.set(widget.metadata.id, widget);
  }

  getWidget(id: string): WidgetComponent | undefined {
    return this.widgets.get(id);
  }

  getAllWidgets(): WidgetComponent[] {
    return Array.from(this.widgets.values());
  }

  getMetadataList(): WidgetMetadata[] {
    return Array.from(this.widgets.values()).map(w => w.metadata);
  }
}

export const WidgetRegistry = new Registry();
