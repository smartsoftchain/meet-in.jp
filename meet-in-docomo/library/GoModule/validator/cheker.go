package validator

import (
	"golang.org/x/net/context"
	"net"
	"regexp"
	"strconv"
	"strings"
	"net/url"
)

type Checker func(context.Context, *Data) bool

func NewChecker(ctx context.Context, rule map[string]interface{}) (func(context.Context, *Data) bool, map[string]int) {
	var (
		schema      = map[string]Schema{}
		crossSchema []CrossSchema
		keyCountor  = map[string]int{}
		ok          bool
	)

	if _, ok = rule["cross"]; ok {
		crossSchema = make([]CrossSchema, 0, len(rule["cross"].([]interface{})))
		for i := 0; len(rule["cross"].([]interface{})) > i; i++ {
			if csc := NewCrossSchema(rule["cross"].([]interface{})[i]); csc != nil {
				crossSchema = append(crossSchema, *csc)
				for _, h := range csc.Target {
					keyCountor[h]++
				}
			}
		}
	}

	if _, ok = rule["schema"]; ok {
		for k, v := range rule["schema"].(map[string]interface{}) {
			if sc := NewSchema(v); sc != nil {
				keyCountor[k] += sc.MaxErrCount
				schema[k] = *sc
			}
		}
	}

	fn := func(ctx context.Context, d *Data) bool {
		for k, _ := range d.Data {
			for i := 0; len(schema[k].Funcs) > i; i++ {
				if schema[k].Funcs[i](d.Data[k]) {
					d.HasError = true
				}
			}
		}
		for _, csc := range crossSchema {
			csc.Check(ctx, d)
		}
		return d.HasError
	}

	return fn, keyCountor

}

type CellChecker func(c *Cell) bool

func NewCellChecker(key string, args ...interface{}) CellChecker {
	switch key {
	case "required":
		return func(c *Cell) bool {
			if c.Length > 0 {
				return false
			} else {
				c.report("この項目は必須です。")
				return true
			}
		}
	case "length":
		if len(args) > 0 {
			if i, ok := args[0].(int); ok && i > 0 {
				return func(c *Cell) bool {
					if c.Length <= i {
						return false
					} else {
						c.report("文字数オーバーです。")
						return true
					}
				}
			}
		}
		return nil
	case "email":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if emailRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("不正なメールアドレスです。")
				return true
			}
		}
	case "postcode":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if postcodeRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("不正な郵便番号です。")
				return true
			}
		}
	case "url":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			str := c.String()
			if str == "" || len(str) >= 2083 || len(str) <= 3 || strings.HasPrefix(str, ".") {
				c.report("不正なURLです。")
				return true
			}
			u, err := url.Parse(str)
			if err != nil {
				c.report("不正なURLです。")
				return true
			}
			if strings.HasPrefix(u.Host, ".") {
				c.report("不正なURLです。")
				return true
			}
			if u.Host == "" && (u.Path != "" && !strings.Contains(u.Path, ".")) {
				c.report("不正なURLです。")
				return true
			}
			if urlRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("不正なURLです。")
				return true
			}
		}
	case "numeric":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if _, err := strconv.ParseInt(c.String(), 10, 64); err == nil {
				return false
			} else {
				c.report("整数を入力してください。")
				return true
			}
		}
	case "alpha":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if alphaRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("英字を入力してください。")
				return true
			}
		}
	case "alphaNumeric":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if alphaNumericRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("英数字を入力してください。")
				return true
			}
		}
	case "alphaNumericSymbol":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if alphaNumericSymbleRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("英数字記号を入力してください。")
				return true
			}
		}
	case "naturalNumeric":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if i, err := strconv.ParseInt(c.String(), 10, 64); err == nil && i > 0 {
				return false
			} else {
				c.report("自然数を入力してください。")
				return true
			}
		}
	case "webIp":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if ip := net.ParseIP(c.String()); ip != nil {
				return false
			} else {
				c.report("WebIPアドレスとして不正です。")
				return true
			}
		}
	case "telephone":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if telRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("電話番号として不正です。")
				return true
			}
		}
	case "color":
		return func(c *Cell) bool {
			if c.Length == 0 {
				return false
			}
			if colorRegexp.Match(c.Bytes()) {
				return false
			} else {
				c.report("カラーコードとして不正です。")
				return true
			}
		}
	default:
		return nil
	}
}

var (
	// 電話・Fax番号
	telRegexp      = regexp.MustCompile(`^[\d()-]+$`)
	// 郵便番号
	postcodeRegexp = regexp.MustCompile(`^\d{3}-?\d{4}$`)
	// Email
	emailRegexp = regexp.MustCompile("^([a-zA-Z0-9])+([a-zA-Z0-9._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9._-]+)+$")
	// URL
	urlRegexp = regexp.MustCompile(`^(ftp|https?):\/\/(\S+(:\S*)?@)?((([1-9]\d?|1\d\d|2[01]\d|22[0-3])(\.(1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.([0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(([a-zA-Z0-9]([a-zA-Z0-9-]+)?[a-zA-Z0-9]([-\.][a-zA-Z0-9]+)*)|((www\.)?))?(([a-zA-Z\x{00a1}-\x{ffff}0-9]+-?-?)*[a-zA-Z\x{00a1}-\x{ffff}0-9]+)(?:\.([a-zA-Z\x{00a1}-\x{ffff}]{1,}))?))(:(\d{1,5}))?((\/|\?|#)[^\s]*)?$`)
	// 半角英字
	alphaRegexp = regexp.MustCompile(`^[a-zA-Z]+$`)
	// 半角英数字
	alphaNumericRegexp = regexp.MustCompile(`^[a-zA-Z0-9]+$`)
	// 半角英数字記号(記号: 「.@-_」)
	alphaNumericSymbleRegexp = regexp.MustCompile(`^[a-zA-Z0-9.@-_]+$`)
	// 色
	colorRegexp = regexp.MustCompile(`^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`)
)

type CrossChecker func(ctx context.Context, d *Data) bool

func NewCrossChecker(key string, target []string, errPos []string, errMsg string, args ...interface{}) CrossChecker {
	switch key {
	case "concatLength":
		if len(args) > 0 {
			if _, ok := args[0].(float64); ok {
				return func(ctx context.Context, d *Data) bool {
					var total int
					for _, t := range target {
						total += d.Data[t].Length
					}
					if total <= int(args[0].(float64)) {
						return false
					} else {
						d.HasError = true
						d.report(ctx, errPos, errMsg)
						return true
					}
				}
			}
		}
	}
	return nil
}
