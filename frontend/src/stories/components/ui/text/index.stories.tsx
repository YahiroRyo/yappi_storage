import { config } from "@/components/ui/config";
import { Text } from "@/components/ui/text";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/UI/Text",
  component: Text,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: config.color.text,
    size: "medium",
    children: "テスト",
  },
};
