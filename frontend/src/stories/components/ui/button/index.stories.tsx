import { Button } from "@/components/ui/button";
import { config } from "@/components/ui/config";
import { Text } from "@/components/ui/text";
import type { Meta, StoryObj } from "@storybook/react";
import styles from "./index.module.scss";

const meta = {
  title: "Components/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: {
      backgroundColor: config.color.surface,
      selectedBackgroundColor: config.color.bgSecondaryContainer,
      textColor: config.color.text,
      selectedTextColor: config.color.textSecondaryContainer,
    },
    radius: `32px`,
    children: (
      <Text className={styles.text} size="medium">
        テスト
      </Text>
    ),
  },
};
