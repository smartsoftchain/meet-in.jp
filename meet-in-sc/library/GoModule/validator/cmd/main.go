package main

import (
	validator ".."
	"encoding/json"
	"fmt"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/net/context"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"sync"
	"time"
)

type IndexedData struct {
	id int64
	d  validator.Data
}

func main() {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cpu := runtime.NumCPU()

	arg := os.Args[1]
	var inFile string
	if filepath.IsAbs(arg) {
		inFile = arg
	} else {
		inFile, _ = filepath.Abs(arg)
	}

	if _, err := os.Stat(inFile); err != nil {
		log.Fatalf("設定ファイルが存在しません。: %s", err)
	}
	configFile, _ := os.OpenFile(inFile, os.O_RDONLY, 0)
	defer configFile.Close()

	data := map[string]interface{}{}
	err := json.NewDecoder(configFile).Decode(&data)
	if err != nil {
		log.Fatalf("設定ファイルを正しくJSONデコードできません。: %s", err.Error())
	}

	wg := new(sync.WaitGroup)

	var limit int64 = 100
	if _, ok := data["validationRule"].(map[string]interface{})["limit"]; ok {
		limit = int64(data["validationRule"].(map[string]interface{})["limit"].(float64))
	}

	wg.Add(1)
	dataCh := make(chan IndexedData)

	checker, keyCountor := validator.NewChecker(ctx, data["validationRule"].(map[string]interface{}))
	sort := make([]string, 0, len(keyCountor))
	if _, ok := data["validationRule"].(map[string]interface{})["sort"]; ok {
		sortKeys := data["validationRule"].(map[string]interface{})["sort"].([]interface{})
		for _, v := range sortKeys {
			sort = append(sort, v.(string))
		}
	} else {
		for k, _ := range keyCountor {
			sort = append(sort, k)
		}
	}

	go writer(dataCh, wg, limit, sort)

	vwg := new(sync.WaitGroup)
	if len(data["validationData"].([]interface{}))/cpu > 1 {
		vwg.Add(cpu)
		for i := 0; cpu > i; i++ {
			if i == cpu-1 {
				go check(
					ctx, checker,
					data["validationData"].([]interface{})[i*(len(data["validationData"].([]interface{}))/cpu):],
					i*(len(data["validationData"].([]interface{}))/cpu),
					keyCountor, dataCh, vwg,
				)
			} else {
				go check(
					ctx, checker,
					data["validationData"].([]interface{})[i*(len(data["validationData"].([]interface{}))/cpu):(i+1)*(len(data["validationData"].([]interface{}))/cpu)],
					i*(len(data["validationData"].([]interface{}))/cpu),
					keyCountor, dataCh, vwg,
				)
			}
		}

	} else {
		vwg.Add(1)
		check(ctx, checker, data["validationData"], 0, keyCountor, dataCh, vwg)
	}

	vwg.Wait()
	close(dataCh)
	wg.Wait()
}

func check(
	ctx context.Context,
	checker validator.Checker,
	data interface{},
	offset int,
	keyCountor map[string]int,
	dataCh chan IndexedData,
	vwg *sync.WaitGroup,
) {
	if _, ok := data.([]interface{}); ok {
		for i := 0; len(data.([]interface{})) > i; i++ {
			d := validator.NewData(ctx, data.([]interface{})[i], keyCountor)

			// 全てcheckを通っているかの検証のときに使う
			//   fmt.Printf("%05d\n", int64(offset) + int64(i))
			// コマンド
			//   go run main.go ../test/test.json > tmp && sort tmp
			if checker(ctx, d) {
				dataCh <- IndexedData{int64(offset) + int64(i), *d}
			}
		}
	}
	vwg.Done()
}

func writer(dataCh chan IndexedData, wg *sync.WaitGroup, limit int64, sortKeys []string) {
	bs := make([]byte, 0, 93000)
	bs = append(bs, []byte(`{"data":[`)...)
	var counter int64 = 0
	for {
		indexedData, ok := <-dataCh
		if !ok {
			break
		}
		if counter < limit {
			if counter > 0 {
				bs = append(bs, []byte(`,`)...)
			}
			bs = append(bs, []byte(`{"index_`)...)
			bs = append(bs, []byte(strconv.FormatInt(indexedData.id, 10))...)
			bs = append(bs, []byte(`":`)...)
			bs = append(bs, indexedData.d.JsonBytes(sortKeys)...)
			bs = append(bs, []byte(`}`)...)
		}
		counter++
	}
	bs = append(bs, []byte(`],"count":`)...)
	bs = append(bs, []byte(strconv.FormatInt(counter, 10))...)
	bs = append(bs, []byte(`}`)...)

	fileName := string(append([]byte(uuid.NewV4().String()), []byte(".json")...))
	ioutil.WriteFile(fileName, bs, os.ModePerm)
	fmt.Print(fileName)
	wg.Done()
}
