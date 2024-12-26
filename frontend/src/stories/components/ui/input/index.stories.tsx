import { config } from "@/components/ui/config";
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Components/UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    type: "text",
    radius: "32px",
    padding: "1rem",
    color: {
      backgroundColor: config.color.surfaceHover,
      focusBackgroundColor: config.color.surface,
      placeholderColor: config.color.text,
      focusColor: config.color.text,
    },
    focusBoxShadow: `0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12),
    0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15)`,
    placeholder: "ドライブで検索",
  },
};
