declare module "react-simple-maps" {
  import type { ComponentProps, ReactNode } from "react";

  export interface GeographyProps {
    geography: object;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    style?: {
      default?: object;
      hover?: object;
      pressed?: object;
    };
    fill?: string;
    className?: string;
  }

  export function ComposableMap(props: {
    projection?: string;
    projectionConfig?: object;
    className?: string;
    style?: object;
    children?: ReactNode;
  }): JSX.Element;

  export function Geographies(props: {
    geography: string | object;
    children: (args: {
      geographies: Array<{ id?: string | number; rsmKey: string; properties?: Record<string, unknown> }>;
    }) => ReactNode;
  }): JSX.Element;

  export function Geography(props: GeographyProps): JSX.Element;

  export function Marker(props: {
    coordinates: [number, number];
    children?: ReactNode;
  }): JSX.Element;
}

declare module "d3-geo" {
  export function geoCentroid(
    object: GeoJSON.Feature | GeoJSON.GeometryCollection | GeoJSON.Geometry
  ): [number, number];
}

declare module "topojson-client" {
  import type { Topology } from "topojson-specification";

  export function feature<T extends Topology>(
    topology: T,
    object: T["objects"][string]
  ): GeoJSON.FeatureCollection;
}
