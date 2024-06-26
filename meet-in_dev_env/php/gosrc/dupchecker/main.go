package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"unicode"

	"golang.org/x/text/unicode/norm"
)

const dash byte = '-'

var th = []interface{}{
	"ファイル名",
	"重複先ファイル名",
	"企業名",
	"重複先企業名",
	"電話番号",
	"重複先電話番号",
	"メールアドレス",
	"重複先メールアドレス",
	"Fax番号",
	"重複先Fax番号",
}

const (
	CompanyName int = iota
	Telephone
	Mail
	Fax
)

type normalizer struct {
	buf []byte

	dict     map[int]map[int][4]string
	nameDict map[int]string
}

func (n *normalizer) normalize(str string) (result string) {
	nrm := norm.NFKC.String(str)
	if len(str) > len(n.buf) {
		n.buf = make([]byte, len(n.buf))
	}
	for _, r := range nrm {
		if !unicode.IsSpace(r) {
			n.buf = append(n.buf, string(r)...)
		}
	}
	result = string(n.buf)
	n.buf = n.buf[:0]
	return
}

func (n *normalizer) onlyNumber(str string) (result string) {
	nrm := norm.NFKC.String(str)
	if len(str) > len(n.buf) {
		n.buf = make([]byte, len(n.buf))
	}
	for _, r := range nrm {
		if r == '0' || r == '1' || r == '2' || r == '3' || r == '4' || r == '5' || r == '6' || r == '7' || r == '8' || r == '9' {
			n.buf = append(n.buf, string(r)...)
		}
	}
	result = string(n.buf)
	n.buf = n.buf[:0]
	return
}

func outputFileName(inputFileName string) string {
	seps := strings.Split(inputFileName, ".")
	return string(append([]byte(seps[0]), ".out.json"...))
}

func main() {
	n := new(normalizer)

	var err error
	inputFileName, err := getInputFileName()
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}
	m, err := fileToMap(inputFileName)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(2)
	}

	outputFileName := outputFileName(inputFileName)

	// 値を標準化
	n.norm(m)

	// 重複データを元に重複チェック
	dups := n.dupCheck(m)
	outputFile, err := os.Create(outputFileName)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(3)
	}
	json.NewEncoder(outputFile).Encode(map[string]interface{}{
		"clientDbUploadFileList":          m,
		"duplicateClientDbUploadFileList": dups,
	})
	fmt.Println(outputFileName)
}

func (n *normalizer) norm(m interface{}) {
	n.dict = make(map[int]map[int][4]string, len(m.([]interface{})))
	n.nameDict = make(map[int]string, len(m.([]interface{})))
	for _, list := range m.([]interface{}) {
		seq := int(list.(map[string]interface{})["seq"].(float64))
		n.nameDict[seq] = list.(map[string]interface{})["name"].(string)
		n.dict[seq] = make(map[int][4]string, len(list.(map[string]interface{})["registData"].([]interface{})))
		for rowIndex, row := range list.(map[string]interface{})["registData"].([]interface{}) {
			// 初期化
			var convertedCompanyName, convertedTelephone, convertedMail, convertedFax string

			if companyName, exist := row.(map[string]interface{})["company_name"]; exist {
				// 重複チェック用に整形
				convertedCompanyName = n.normalize(companyName.(string))
			}

			if telNumber, exist := row.(map[string]interface{})["tel"]; exist {
				// 重複チェック用に整形
				convertedTelephone = n.onlyNumber(telNumber.(string))
			}

			if mail, exist := row.(map[string]interface{})["mail"]; exist {
				// 重複チェック用に整形
				convertedMail = mail.(string)
			}

			if faxNumber, exist := row.(map[string]interface{})["fax"]; exist {
				// 重複チェック用に整形
				convertedFax = n.onlyNumber(faxNumber.(string))
			}

			if convertedMail != "" || convertedTelephone != "" || convertedCompanyName != "" || convertedFax != "" {
				n.dict[seq][rowIndex] = [4]string{convertedCompanyName, convertedTelephone, convertedMail, convertedFax}
			}
		}
	}
}

func (n *normalizer) dupCheck(m interface{}) map[string]interface{} {
	dupList := make(map[string]interface{})
	for _, list := range m.([]interface{}) {
		seq := int(list.(map[string]interface{})["seq"].(float64))
		list.(map[string]interface{})["duplicateCount"] = 0
		list.(map[string]interface{})["duplicateIndex"] = make([]int64, 0, 10)
		if _, exist := list.(map[string]interface{})["registData"]; !exist {
			break
		}
		listName := list.(map[string]interface{})["name"].(string)

		for index, _ := range list.(map[string]interface{})["registData"].([]interface{}) {
			if _, exist := n.dict[seq][index]; exist {
				var convertedCompanyName string = n.dict[seq][index][CompanyName]
				var convertedTelephone string = n.dict[seq][index][Telephone]
				var convertedMail string = n.dict[seq][index][Mail]
				var convertedFax string = n.dict[seq][index][Fax]
				duplicateFlg := false
				for tmpListSeq, tmpList := range n.dict {
					for tmpRowIndex, tmpRow := range tmpList {
						if tmpListSeq != seq || (tmpListSeq == seq && index != tmpRowIndex) {
							var duplicateState int64
							var tmpConvertedCompanyName = tmpRow[CompanyName]
							var tmpConvertedTelephone = tmpRow[Telephone]
							var tmpConvertedMail = tmpRow[Mail]
							var tmpConvertedFax = tmpRow[Fax]

							if convertedCompanyName != "" && convertedCompanyName == tmpConvertedCompanyName {
								duplicateState++
							}
							if convertedTelephone != "" && convertedTelephone == tmpConvertedTelephone {
								duplicateState += 2
							}
							if convertedMail != "" && convertedMail == tmpConvertedMail {
								duplicateState += 4
							}
							if convertedFax != "" && convertedFax == tmpConvertedFax {
								duplicateState += 8
							}

							if duplicateState > 0 {
								if _, exist := dupList[listName]; !exist {
									dupList[listName] = map[string]interface{}{
										"duplicateList":  make([]interface{}, 0, 5),
										"selectItems":    th,
										"duplicateCount": 0,
									}
								}
								dupList[listName].(map[string]interface{})["duplicateList"] = append(
									dupList[listName].(map[string]interface{})["duplicateList"].([]interface{}),
									map[string]interface{}{
										"duplicateState": duplicateState,
										"data": map[string]interface{}{
											"index":                  index,
											"file_name":              listName,
											"duplicate_file_name":    n.nameDict[tmpListSeq],
											"company_name":           convertedCompanyName,
											"duplicate_company_name": tmpConvertedCompanyName,
											"tel":            convertedTelephone,
											"duplicate_tel":  tmpConvertedTelephone,
											"convertedMail":  convertedMail,
											"duplicate_mail": tmpConvertedMail,
											"fax":            convertedFax,
											"duplicate_fax":  tmpConvertedFax,
										},
									},
								)
								dupList[listName].(map[string]interface{})["duplicateCount"] = dupList[listName].(map[string]interface{})["duplicateCount"].(int) + 1
								duplicateFlg = true
							}
						}
					}
				}
				if duplicateFlg {
					list.(map[string]interface{})["duplicateCount"] = list.(map[string]interface{})["duplicateCount"].(int) + 1
					list.(map[string]interface{})["duplicateIndex"] = append(
						list.(map[string]interface{})["duplicateIndex"].([]int64), int64(index),
					)
				}
			}
		}
	}
	return dupList
}

func getInputFileName() (inputFileName string, err error) {
	if len(os.Args) > 1 {
		inputFileName = os.Args[1]
	} else {
		inputFileName = "default.json"
	}
	if !filepath.IsAbs(inputFileName) {
		inputFileName, err = filepath.Abs(inputFileName)
		if err != nil {
			return "", err
		}
	}
	_, err = os.Stat(inputFileName)
	if err != nil {
		return inputFileName, err
	}
	return inputFileName, nil
}

func fileToMap(fileName string) (interface{}, error) {

	configFile, err := os.OpenFile(fileName, os.O_RDONLY, 0)
	if err != nil {
		return nil, err
	}

	var jsonInput interface{}

	err = json.NewDecoder(configFile).Decode(&jsonInput)
	if err != nil {
		configFile.Close()
		return nil, err
	}
	configFile.Close()
	return jsonInput, nil
}
