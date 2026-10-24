import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/shared/components/combobox';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Select item..." />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="1">Option 1</ComboboxItem>
          <ComboboxItem value="2">Option 2</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Selected: Story = {
  render: () => (
    <div className="w-64">
      <Combobox
        items={['Software', 'Office supplies', 'Travel']}
        defaultValue="Software"
      >
        <ComboboxInput aria-label="Category" placeholder="Select category..." />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
};

export const DisabledSelection: Story = {
  render: () => (
    <Combobox disabled defaultValue="Software">
      <ComboboxInput aria-label="Category" />
    </Combobox>
  ),
};

export const NarrowDarkSelection: Story = {
  render: () => (
    <div className="dark w-72 bg-background p-4 text-foreground">
      <Combobox
        items={['Software', 'Office supplies', 'Travel']}
        defaultValue="Software"
      >
        <ComboboxInput aria-label="Category" placeholder="Select category..." />
        <ComboboxContent className="dark">
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
};

export const ReadOnlySelection: Story = {
  render: () => (
    <Combobox readOnly defaultValue="Software">
      <ComboboxInput aria-label="Category" />
    </Combobox>
  ),
};

export const MultipleChips: Story = {
  render: () => (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {['light', 'dark'].map((theme) => (
        <div key={theme} className={theme}>
          <div className="rounded-md bg-background p-6 text-foreground">
            <Combobox
              multiple
              items={['Vendor', 'Contractor', 'Employer']}
              defaultValue={['Vendor', 'Contractor']}
            >
              <ComboboxChips>
                <ComboboxValue>
                  {(values: string[]) =>
                    values.map((value) => (
                      <ComboboxChip key={value}>{value}</ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput aria-label="Counterparty roles" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(value: string) => (
                    <ComboboxItem key={value} value={value}>
                      {value}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const ThemeColorChips: Story = {
  render: () => (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {['light', 'dark'].map((theme) => (
        <div key={theme} className={theme}>
          <div className="rounded-md bg-background p-6 text-foreground">
            <Combobox
              multiple
              items={['neutral', 'primary', 'secondary']}
              defaultValue={['neutral', 'primary', 'secondary']}
            >
              <ComboboxChips>
                <ComboboxValue>
                  {(values: ('neutral' | 'primary' | 'secondary')[]) =>
                    values.map((value) => (
                      <ComboboxChip key={value} variant={value}>
                        {value}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput aria-label="Chip variants" />
              </ComboboxChips>
            </Combobox>
          </div>
        </div>
      ))}
    </div>
  ),
};
