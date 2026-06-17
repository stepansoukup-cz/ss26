"use client";

import { useState } from "react";
import {
  REVIEW_CRITERIA,
  type ReviewScoreKey,
  type ReviewScores,
  scoreToSliderValue,
} from "@/lib/review-score";
import "./review-score-sliders.css";

function sliderProgress(value: number) {
  return `${(value / 10) * 100}%`;
}

export function ReviewScoreSliders({
  defaults = {
    scoreLegacy: null,
    scorePracticality: null,
    scorePrice: null,
    scoreSound: null,
    scoreLook: null,
  },
}: {
  defaults?: ReviewScores;
}) {
  const [values, setValues] = useState<Record<ReviewScoreKey, number>>(() => ({
    scoreLegacy: scoreToSliderValue(defaults.scoreLegacy),
    scorePracticality: scoreToSliderValue(defaults.scorePracticality),
    scorePrice: scoreToSliderValue(defaults.scorePrice),
    scoreSound: scoreToSliderValue(defaults.scoreSound),
    scoreLook: scoreToSliderValue(defaults.scoreLook),
  }));

  function handleChange(key: ReviewScoreKey, nextValue: number) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  return (
    <div className="space-y-5">
      {REVIEW_CRITERIA.map(({ key, label }) => {
        const sliderValue = values[key];
        const active = sliderValue > 0;

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <label htmlFor={key} className="font-medium text-admin-text">
                {label}
              </label>
              <span
                className={
                  active
                    ? "tabular-nums font-medium text-admin-accent"
                    : "text-admin-faint"
                }
              >
                {active ? `${sliderValue}/10` : "nehodnoceno"}
              </span>
            </div>

            <input
              id={key}
              type="range"
              name={key}
              min={0}
              max={10}
              step={1}
              value={sliderValue}
              onChange={(event) =>
                handleChange(key, Number(event.target.value))
              }
              className={`review-slider ${active ? "review-slider--active" : "review-slider--inactive"}`}
              style={
                active
                  ? ({ "--slider-progress": sliderProgress(sliderValue) } as React.CSSProperties)
                  : undefined
              }
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={sliderValue}
              aria-valuetext={
                active ? `${sliderValue} z 10` : "Nehodnoceno"
              }
            />
          </div>
        );
      })}

      <p className="text-xs text-admin-faint">
        Posuvník na 0 = nehodnoceno (do databáze se neukládá). Posun na 1–10
        kritérium zapne a uloží skóre.
      </p>
    </div>
  );
}
