package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	r := setupRouter()
	// Listen and Server in 0.0.0.0:8080
	r.Run("127.0.0.1:8080")
}

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()
	r := gin.Default()
	r.MaxMultipartMemory = 8 << 20 // 8 MiB

	r.LoadHTMLGlob("templates/*")

	r.Static("/public", "./public")

	r.Use(CORSMiddleware())
	r.Use(ErrorHandler)

	//r.Static("/", "./public")

	// Ping test
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	r.GET("/api/har", GetHar)
	r.GET("/api/screenshot", GetScreenshot)
	r.GET("/api/list", ListAvailableHars)

	// Get user value
	r.POST("/api/new-har", UploadHar)

	return r
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "*")
		//c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

const storageDir = "./uploads/"
const harSuffix = "-har.json"
const screenshotSuffix = "-ss.png"

func UploadHar(c *gin.Context) {
	harId := strings.Replace(uuid.New().String(), "-", "", -1)

	filePrefix := storageDir + harId
	form, err := c.MultipartForm()

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = StoreUploadFile(c, form, "har", filePrefix+harSuffix)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = StoreUploadFile(c, form, "ss", filePrefix+screenshotSuffix)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, gin.H{
		"id": harId,
	})
}

func StoreUploadFile(c *gin.Context, form *multipart.Form, name string, destFile string) error {
	files := form.File[name]

	if len(files) != 1 {
		return errors.New("File " + name + " does not exist in the request")
	}

	file := files[0]

	return c.SaveUploadedFile(file, destFile)
}

func GetHar(c *gin.Context) {
	id := c.Query("id")

	c.File(storageDir + id + harSuffix)
}

func GetScreenshot(c *gin.Context) {
	id := c.Query("id")

	c.File(storageDir + id + screenshotSuffix)
}

func ErrorHandler(c *gin.Context) {
	c.Next()

	for _, err := range c.Errors {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
}

type HarInfo struct {
	Id      string    `json:"id"`
	Created time.Time `json:"created"`
}

func ListAvailableHars(c *gin.Context) {
	files, err := ioutil.ReadDir(storageDir)
	if err != nil {
		log.Fatal(err)
	}

	hars := make(map[string]*HarInfo)

	for _, file := range files {
		id := removeFileSuffix(file.Name())

		har := hars[id]
		if har == nil {
			har = &HarInfo{
				Id:      id,
				Created: file.ModTime(),
			}
			hars[id] = har
		}

		fmt.Println(file.Name(), file.IsDir())
	}

	harList := make([]*HarInfo, 0, len(hars))
	for _, v := range hars {
		harList = append(harList, v)
	}

	// sort by Created in descending order
	sort.Slice(harList, func(i, j int) bool {
		return harList[i].Created.After(harList[j].Created)
	})

	c.JSON(200, harList)
}

func removeFileSuffix(fileName string) string {
	lastDot := strings.LastIndex(fileName, "-")
	if lastDot == -1 {
		return fileName
	}
	return fileName[:lastDot]
}
