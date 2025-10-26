import { useGradient } from '@/contexts/GradientContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const GradientSettings = () => {
  const { settings, updateSettings } = useGradient();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Scroll-Verlauf Einstellungen</CardTitle>
        <CardDescription className="text-muted-foreground">
          Feinabstimmung des Farbverlaufs (Die Hauptfarbe wird automatisch durch dein gewähltes Theme bestimmt)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <Label htmlFor="gradient-enabled" className="text-foreground">
            Scroll-Verlauf aktivieren
          </Label>
          <Switch
            id="gradient-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
          />
        </div>

        {settings.enabled && (
          <>
            {/* End Color */}
            <div className="space-y-3">
              <Label className="text-foreground">Endfarbe beim Scrollen</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.endColor}
                  onChange={(e) => updateSettings({ endColor: e.target.value })}
                  className="h-10 w-20 rounded border border-border bg-background cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.endColor}
                  onChange={(e) => updateSettings({ endColor: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Scroll Trigger Point */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-foreground">Scroll-Trigger-Punkt</Label>
                <span className="text-sm text-muted-foreground">{settings.scrollTriggerPoint}%</span>
              </div>
              <Slider
                value={[settings.scrollTriggerPoint]}
                onValueChange={([value]) => updateSettings({ scrollTriggerPoint: value })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Definiert, wie weit du scrollen musst, bis der Hintergrund vollständig zur Endfarbe übergeblendet ist.
              </p>
            </div>

            {/* Transition Speed */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-foreground">Übergangsgeschwindigkeit</Label>
                <span className="text-sm text-muted-foreground">{settings.transitionSpeed.toFixed(1)}s</span>
              </div>
              <Slider
                value={[settings.transitionSpeed * 10]}
                onValueChange={([value]) => updateSettings({ transitionSpeed: value / 10 })}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Legt fest, wie schnell der Farbwechsel beim Scrollen erfolgt.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
