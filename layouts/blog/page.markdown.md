{{ if not .Params.hideTitle }}# {{ .Title }}

{{ end }}{{ .RenderShortcodes }}
{{- /* The older and newer posts by date, as the HTML page's pager, linking
   their Markdown versions; nothing at either end. */}}
{{- $all := .CurrentSection.RegularPages.ByDate }}
{{- $older := $all.Next . }}
{{- $newer := $all.Prev . }}
{{- if or $older $newer }}

---
{{ with $older }}
- Previous: [{{ .LinkTitle }}]({{ with .OutputFormats.Get "markdown" }}{{ .RelPermalink }}{{ end }})
{{- end }}
{{- with $newer }}
- Next: [{{ .LinkTitle }}]({{ with .OutputFormats.Get "markdown" }}{{ .RelPermalink }}{{ end }})
{{- end }}
{{ end }}
