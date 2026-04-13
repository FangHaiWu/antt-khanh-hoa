export interface GisLayerDefinition {
  id: string;
  name: string;
  type: 'point' | 'polygon' | 'heatmap' | 'line' | 'cluster';
  endpoint: string;
  visibleByDefault: boolean;
  supportsBBox?: boolean;
  supportsTimeFilter?: boolean;
}
