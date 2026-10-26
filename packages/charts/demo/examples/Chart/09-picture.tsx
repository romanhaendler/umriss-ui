import { useEffect, useState } from "react";
import { Legend, Tooltip, useChart } from "../../../src";

export const title = "Hand over a picture";
export const lead = "`toPng()` resolves to a PNG of the plot and its axes on the chart's own ground, in the scheme in use - without the tooltip or the crosshair, even with the pointer resting on the plot. What happens to it is the application's: here it is shown beside the chart.";

const HOUR = 3_600_000;
const START = Date.UTC(2026, 2, 17, 6);
const READINGS = Array.from({ length: 48 }, (_, i) => ({
  t: START + i * (HOUR / 4),
  p95: Math.round(180 + 40 * Math.sin(i / 6) + ((i * 37) % 23)),
}));

export default function Picture() {
  const { Chart, XAxis, YAxis, Line, toPng } = useChart(READINGS);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  // The object URL lives as long as the picture shown.
  useEffect(() => () => (url === null ? undefined : URL.revokeObjectURL(url)), [url]);

  return (
    <>
      <div className="demo-actions">
        <button
          type="button"
          className="demo-button"
          data-picture
          onClick={() =>
            toPng().then(
              (blob) => {
                setFailed(null);
                setUrl(URL.createObjectURL(blob));
              },
              (error: Error) => setFailed(error.message),
            )
          }
        >
          Picture
        </button>
      </div>
      <div className="pair">
        <div>
          <p className="pair-caption">the chart</p>
          <Chart height={240} aria-label="Latency of Refunds">
            <XAxis value="t" time />
            <YAxis label="ms" />
            <Line value="p95" name="Refunds" />
            <Legend />
            <Tooltip />
          </Chart>
        </div>
        <div>
          <p className="pair-caption">the picture</p>
          {url !== null && <img src={url} alt="The picture of the chart" data-role="picture" style={{ width: "100%", height: "auto" }} />}
          {failed !== null && <p role="alert">{failed}</p>}
        </div>
      </div>
    </>
  );
}
