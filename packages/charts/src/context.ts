/* Chart context and the registration hooks (R-2.1).
   Children such as Line/XAxis register themselves with their configuration on
   mount and deregister on unmount; prop changes only update the scene entry
   (R-2.2). Outside a Chart: a DEV invariant; in PROD the components render
   nothing (R-2.3). */

import { createContext, useContext, useEffect, useRef } from "react";
import { DEV } from "./dev";
import { ChartScene } from "./scene";
import type {
  AxisConfig,
  LegendConfig,
  LimitConfig,
  SeriesConfig,
  TooltipConfig,
} from "./types";

export const ChartContext = createContext<ChartScene | null>(null);

/** Scene out of the context; throws in DEV outside a Chart (R-2.3). */
export function useChartScene(componentName: string): ChartScene | null {
  const scene = useContext(ChartContext);
  if (scene === null && DEV) {
    throw new Error(
      `@umriss-ui/charts: <${componentName}> must be used inside a <Chart>.`,
    );
  }
  return scene;
}

/** Registration of a series; the order in the JSX is the registration order. */
export function useSeries(componentName: string, config: SeriesConfig): void {
  const scene = useChartScene(componentName);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if (scene === null) return;
    idRef.current = scene.registerSeries(config);
    return () => {
      if (idRef.current !== null) scene.unregisterSeries(idRef.current);
      idRef.current = null;
    };
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (scene !== null && idRef.current !== null) {
      scene.updateSeries(idRef.current, config);
    }
  });
}

/** Registration of an axis (instantiable several times, R-4.12). */
export function useAxis(componentName: string, config: AxisConfig): void {
  const scene = useChartScene(componentName);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if (scene === null) return;
    idRef.current = scene.registerAxis(config);
    return () => {
      if (idRef.current !== null) scene.unregisterAxis(idRef.current);
      idRef.current = null;
    };
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (scene !== null && idRef.current !== null) {
      scene.updateAxis(idRef.current, config);
    }
  });
}

/** Registration of a limit. Any number per chart; they register themselves like
    a series, but they are none - that stands in types.ts. */
export function useLimit(componentName: string, config: LimitConfig): void {
  const scene = useChartScene(componentName);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if (scene === null) return;
    idRef.current = scene.registerLimit(config);
    return () => {
      if (idRef.current !== null) scene.unregisterLimit(idRef.current);
      idRef.current = null;
    };
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (scene !== null && idRef.current !== null) {
      scene.updateLimit(idRef.current, config);
    }
  });
}

/** Registration of the legend (exactly one per chart). */
export function useLegend(componentName: string, config: LegendConfig): void {
  const scene = useChartScene(componentName);

  useEffect(() => {
    if (scene === null) return;
    scene.registerLegend(config);
    return () => scene.unregisterLegend();
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    scene?.updateLegend(config);
  });
}

/** Registration of the data table (exactly one per chart), under the id its
    panel carries. */
export function useDataTable(componentName: string, id: string): void {
  const scene = useChartScene(componentName);

  useEffect(() => {
    if (scene === null) return;
    scene.registerDataTable(id);
    return () => scene.unregisterDataTable();
  }, [scene, id]);
}

/** Registration of the tooltip (exactly one per chart). */
export function useTooltip(componentName: string, config: TooltipConfig): void {
  const scene = useChartScene(componentName);

  useEffect(() => {
    if (scene === null) return;
    scene.registerTooltip(config);
    return () => scene.unregisterTooltip();
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    scene?.updateTooltip(config);
  });
}
