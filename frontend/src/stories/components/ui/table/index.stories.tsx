import { Border } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import { config } from "@/components/ui/config";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { SelectableTable } from "@/components/ui/table";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";

const meta = {
  title: "Components/UI/SelectableTable",
  component: SelectableTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  decorators: [
    (Story) => {
      useEffect(() => {
        document.body.oncontextmenu = () => false;
      }, []);

      return <Story />;
    },
  ],
} satisfies Meta<typeof SelectableTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [...Array(10)].map((_, index) => {
  return {
    id: index,
    created_at: new Date().toString(),
  };
});

export const Primary: Story = {
  args: {
    isFixedHead: false,
    headers: ["id", "created_at"],
    data: data,
    selectedRowBackgroundColor: config.color.bgSecondaryContainer,
    selectedChildren: (
      <GridVerticalRow gap=".5rem">
        <Button
          padding="0.5rem 1rem"
          color={{ hoverBackgroundColor: config.color.surfaceHover }}
        >
          テストのボタンです。下にボーダーがあります。
        </Button>
        <Border color={config.color.surfaceHover} />
        <Button
          padding="0.5rem 1rem"
          color={{ hoverBackgroundColor: config.color.surfaceHover }}
        >
          テストのボタンです。上にボーダーがあります。
        </Button>
        <Button
          padding="0.5rem 1rem"
          color={{ hoverBackgroundColor: config.color.surfaceHover }}
        >
          テストのボタンです。これ最後なのだ。
        </Button>
      </GridVerticalRow>
    ),
  },
};
