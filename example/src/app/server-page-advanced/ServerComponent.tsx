import { Text } from "@vercel/examples-ui";

export default function ServerComponent({ name }: { name: string }) {
  return (
    <Text>
      Variant in server component: <strong>{name}</strong>
    </Text>
  );
}
