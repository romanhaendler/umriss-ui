import { useEffect, useState } from "react";
import { Legend, LimitLine, Tooltip, useChart } from "../../../src";

export const title = "Hand over a picture";
export const lead = "`toPng()` resolves to a PNG of the plot, its axes with their breaks, the limits and the legend, on the chart's own ground, in the scheme in use - without the tooltip or the crosshair, even with the pointer resting on the plot. What happens to it is the application's: here it is shown beside the chart.";

const HOUR = 3_600_000;
const START = Date.UTC(2026, 2, 17, 6);
const READINGS = Array.from({ length: 48 }, (_, i) => ({
  t: START + i * (HOUR / 4),
  p95: Math.round(180 + 40 * Math.sin(i / 6) + ((i * 37) % 23)),
  p50: Math.round(110 + 25 * Math.sin(i / 5) + ((i * 17) % 11)),
}));
// Two shifts, with the hours between them taken off the axis.
const SHIFTS = [
  { from: START, to: START + 4 * HOUR },
  { from: START + 8 * HOUR, to: START + 12 * HOUR },
];

export default function Picture() {
  const { Chart, XAxis, YAxis, Line, toPng } = useChart(READINGS);
  const [url, setUrl] = useState<string | null>(null);
  const [marks, setMarks] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  // The object URL lives as long as the picture shown.
  useEffect(() => () => (url === null ? undefined : URL.revokeObjectURL(url)), [url]);

  return (
    <>
      <div className="demo-actions">
        <button type="button" className="demo-button" data-encoding aria-pressed={marks} onClick={() => setMarks(!marks)}>
          Marks
        </button>
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
          <Chart height={240} aria-label="Latency of Refunds" encoding={marks ? "marks" : "color"}>
            <XAxis value="t" time calendar={SHIFTS} />
            <YAxis label="ms" />
            <Line value="p95" name="Refunds p95" />
            <Line value="p50" name="Refunds p50" />
            <LimitLine value={240} severity="alarm" label="Too slow" />
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
