import { Button } from "@/components/ui/button";
import { uiConfig } from "@/components/ui/uiConfig";
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
      backgroundColor: uiConfig.color.surface.main,
      selectedBackgroundColor: uiConfig.color.bg.secondary.container,
      textColor: uiConfig.color.text.main,
      selectedTextColor: uiConfig.color.text.secondary.container,
    },
    radius: `32px`,
    children: (
      <Text className={styles.text} size="medium">
        テスト
      </Text>
    ),
  },
};
