"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { ChartContainer } from "@/components/ui/chart";

export const description = "A radial chart showing quiz progress";

const chartConfig = {
  progress: {
    label: "Progress",
  },
};

interface QuizProgressProps {
  totalQuestions: number;
  attemptedQuestions: number;
}

export default function QuizProgress({
  totalQuestions,
  attemptedQuestions,
}: QuizProgressProps) {
  const chartData = [
    {
      progress: (attemptedQuestions / totalQuestions) * 100,
      fill: "#10b981",
    },
  ];
  const endAngle = 90 - (360 * attemptedQuestions) / totalQuestions;
  return (
    <div className="flex justify-end">
      <ChartContainer
        config={chartConfig}
        className="ml-auto aspect-square h-32"
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={endAngle}
          innerRadius={55}
          outerRadius={80}
          cx="50%"
          cy="50%"
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[60, 50]}
          />
          <RadialBar
            dataKey="progress"
            background
            cornerRadius={10}
            fill="hsl(var(--chart-2))"
          />

          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }: any) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-4xl font-bold"
                      >
                        {attemptedQuestions}/{totalQuestions}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Questions
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}
