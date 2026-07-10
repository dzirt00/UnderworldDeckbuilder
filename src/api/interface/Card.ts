export interface Card  {
    id: string,
    name: string,
    faction: string,
    type: "objective" | "ploy" | "upgrade" ,
    description: string,
    glory: number,
    restricted: boolean,
    setId: string,
    faq: string | null,
    surge: boolean,
    image: string,
    imageFaction: string,
    imageType: string,
    imageDeck: string,
    forsaken: boolean
}